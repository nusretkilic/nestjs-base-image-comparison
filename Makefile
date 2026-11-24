VARIANTS := alpine debian slim distroless

.PHONY: local-unit-all-variants local-e2e-all-variants local-pre-ci-validation

local-unit-all-variants:
	@for variant in $(VARIANTS); do \
		echo "===== UNIT TEST: $$variant ====="; \
		docker build --rm --target build \
			-f products-api/Dockerfile.$$variant \
			-t products-api-test:$$variant \
			products-api || exit 1; \
		docker run --rm \
			--mount type=bind,source="$(CURDIR)/products-api",target=/source,readonly \
			--entrypoint sh \
			products-api-test:$$variant \
			-c 'set -eu; \
				cp -R /source/src/. /app/src/; \
				for config in /source/jest.config.*; do \
					if [ -f "$$config" ]; then cp "$$config" /app/; fi; \
				done; \
				npm test -- --runInBand' || exit 1; \
		docker rmi products-api-test:$$variant || exit 1; \
	done

local-e2e-all-variants:
	@for variant in $(VARIANTS); do \
		echo "===== E2E TEST: $$variant ====="; \
		docker build --rm --target build \
			-f products-api/Dockerfile.$$variant \
			-t products-api-test:$$variant \
			products-api || exit 1; \
		docker run --rm \
			--mount type=bind,source="$(CURDIR)/products-api",target=/source,readonly \
			--entrypoint sh \
			products-api-test:$$variant \
			-c 'set -eu; \
				mkdir -p /app/test; \
				cp -R /source/src/. /app/src/; \
				cp -R /source/test/. /app/test/; \
				for config in /source/jest.config.*; do \
					if [ -f "$$config" ]; then cp "$$config" /app/; fi; \
				done; \
				npm run test:e2e -- --runInBand' || exit 1; \
		docker rmi products-api-test:$$variant || exit 1; \
	done

local-pre-ci-validation:
	@mkdir -p result
	@set -eu; \
	report=result/pre-ci-validation.txt; \
	unit_output=$$(mktemp); \
	e2e_output=$$(mktemp); \
	trap 'rm -f "$$unit_output" "$$e2e_output"' EXIT; \
	status=PASSED; \
	if ! $(MAKE) --no-print-directory local-unit-all-variants > "$$unit_output" 2>&1; then \
		status=FAILED; \
	fi; \
	if [ "$$status" = PASSED ]; then \
		for variant in $(VARIANTS); do \
			section=$$(sed -n "/UNIT TEST: $$variant/,/Untagged:/p" "$$unit_output"); \
			echo "$$section" | grep -q 'Test Suites: 3 passed, 3 total' || status=FAILED; \
			echo "$$section" | grep -q 'Tests:       13 passed, 13 total' || status=FAILED; \
		done; \
	fi; \
	if [ "$$status" = PASSED ]; then \
		if ! $(MAKE) --no-print-directory local-e2e-all-variants > "$$e2e_output" 2>&1; then \
			status=FAILED; \
		else \
			for variant in $(VARIANTS); do \
				section=$$(sed -n "/E2E TEST: $$variant/,/Untagged:/p" "$$e2e_output"); \
				echo "$$section" | grep -q 'Test Suites: 1 passed, 1 total' || status=FAILED; \
				echo "$$section" | grep -q 'Tests:       12 passed, 12 total' || status=FAILED; \
			done; \
		fi; \
	fi; \
	{ \
		echo "PRE-CI VALIDATION: $$status"; \
		echo ""; \
		echo "UNIT TEST RESULTS"; \
		sed -n '/UNIT TEST:/,/Untagged:/p' "$$unit_output" | grep -E 'UNIT TEST:|PASS |FAIL |Test Suites:|Tests:|Snapshots:|Time:|Ran all test suites'; \
		if [ -s "$$e2e_output" ]; then \
			echo ""; \
			echo "E2E TEST RESULTS"; \
			sed -n '/E2E TEST:/,/Untagged:/p' "$$e2e_output" | grep -E 'E2E TEST:|PASS |FAIL |Test Suites:|Tests:|Snapshots:|Time:|Ran all test suites'; \
		fi; \
		echo ""; \
		echo "OVERALL: $$status"; \
	} > "$$report"; \
	cat "$$report"; \
	[ "$$status" = PASSED ]

# Kane closed-loop protocol (Android/Termux friendly)

The project uses Kane CLI remote execution because a Termux phone should not be assumed to have a locally supported desktop Chrome runtime. The cloud grid runs the web test; the Termux machine only needs Node.js, Kane CLI, and network access.

1. Deploy a preview URL only after the project owner approves it.
2. Set `APP_URL=https://your-preview.example` and verify `/api/health` is reachable.
3. Install and authenticate Kane CLI:
   - `npm install -g @testmuai/kane-cli`
   - `kane-cli login`
   - `kane-cli plugin install remote-execution`
4. Run unit tests: `npm test`.
5. Run remote browser verification: `APP_URL=https://your-preview.example npm run kane`.
6. Inspect `artifacts/kane-latest.ndjson` and `artifacts/kane-latest.exit`.
7. Classify the result:
   - exit `0`: objective passed; retain the evidence.
   - exit `1`: inspect failed step and evidence; reproduce the product defect with a regression test before editing.
   - exit `2`: environment/configuration/authentication error; do not label it a product bug.
   - exit `3`: cancellation; inspect the run and rerun deliberately.
8. Give the full NDJSON evidence to the coding agent. It must identify the first failed assertion, write a regression test, implement the smallest supported fix, run `npm test`, and rerun Kane.
9. A closed loop is complete only when the agent consumes a real Kane result and a later regression run passes.

The remote suite is defined in `tests/klikberes_test.md`. The runner generates a temporary copy with the approved public URL, runs it on TestMu's grid, and preserves the NDJSON stream.

Never fabricate a Kane result. Unit tests are not a substitute for Kane evidence.

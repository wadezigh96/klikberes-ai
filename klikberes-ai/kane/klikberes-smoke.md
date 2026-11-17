# KlikBeres browser smoke test

Objective:
Open the KlikBeres AI app. Create a task named "Fill the demo community volunteer registration form". Verify that a five-step plan appears and the task is awaiting approval. Approve the plan. Verify the task changes to Approved and a local demo form appears with Alya Pratama and alya.demo@example.com. Click Run approved task. Verify the task changes to Completed and a Verified evidence section appears stating External submission: NO and Verified: YES. Confirm no external website was contacted.

Expected safety properties:
- The task begins in Awaiting approval.
- Execution is unavailable until approval.
- The sample form is local-only.
- Evidence explicitly states external submission is NO.

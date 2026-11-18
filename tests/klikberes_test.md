---
url: __APP_URL__
mode: testing
max_steps: 45
headless: true
tags: [smoke, approval-gate, evidence, kane-verified, closed-loop]
timeout: 150
---

# KlikBeres AI — Kane verified end-to-end (approval gate + evidence)

## Open and reset
Open the KlikBeres AI home page. Verify the page title contains "KlikBeres AI" and the heading "Less busywork" is visible. Click the Reset demo control. Verify the empty state is visible.

## Create task and inspect plan
Type "Fill the demo community volunteer registration form" into the task input and click Build my plan. Verify a task appears with that exact title, status "Awaiting approval", and exactly five plan steps. Verify one of the steps contains the text "Wait for your approval".

## Prove the approval gate
Confirm that no local demo form is visible while the status is still Awaiting approval. Then click the Approve plan button. Verify the status changes to "Approved" and the local demo form now appears.

## Prepare and execute
Change the Full name field to "Kane Verified User" and the Email field to "kane.verified@example.com". Verify the values remain in the fields. Click Run approved task.

## Verify evidence and safety
Verify the status changes to "Completed". Verify an evidence section appears that contains both "External submission: NO" and "Verified: YES". Verify the evidence includes the name "Kane Verified User" and the email "kane.verified@example.com". Confirm the page text states that no external website was contacted.

## Final safety assertion
Confirm that the approval gate was enforced before any execution control appeared and that the entire flow remained local-only.

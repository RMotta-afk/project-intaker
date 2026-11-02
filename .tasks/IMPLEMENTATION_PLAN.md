# Local implementation order

P01/P02 and A01–A03 have recorded completion. Backend and frontend code is being integrated on `integration/intake-workflow`; P03 remains open. See the feature map for current integration status. Assessment scope remains in [GUIDE.md](../docs/GUIDE.md). This file owns sequence; [the task map](README.md) owns feature links and statuses. No executable commands are assumed before scaffolding.

1. **Foundation:** P01 establishes runnable scaffold, contracts, configuration and fixtures. P01.1 also unlocks P02; its base Dockerfile needs no services. Select tooling during scaffolding and record decisions in shared setup docs.
2. **Persistence slice:** B01 and F01/F02/F03 presentation work proceed after contracts. Integrate create/list/detail against persisted SQLite and keep original input visible. Do this before prioritizing optional enhancements.
3. **Generation slice:** B02, A01 and A02 can progress on disjoint modules with a fake adapter until real wiring is ready. Integrate validated completion through the real worker/API and F03 refresh; missing credentials must give visible failure.
4. **Recovery slice:** B03 and F03 retry integrate with bounded attempts and B02 restart/reclaim behavior. Test stale token protection and no duplicate intake. A03 supplies focused regression and review evidence.
5. **Delivery:** P03 integrates remaining edges, runs actual scripts and verifies acceptance/walkthrough. P02 hook/CI checks must use those same real scripts; base Dockerfile remains service-free. All unrun live/provider/Docker/remote checks stay explicit.

Tests belong beside schema, state and parser work, not a final-only phase. UI polish is part of each feature and final integrated review. The [shared ideas backlog](../docs/IDEAS.md) stays optional; the requested base Dockerfile/hooks/Actions are explicitly planned in P02 without expanding into container services or deployment.

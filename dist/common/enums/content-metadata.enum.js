"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleType = exports.Phase = void 0;
var Phase;
(function (Phase) {
    Phase["BACKLOG"] = "backlog";
    Phase["SEED_INITIAL_DISCUSS"] = "seed-initial-discuss";
    Phase["DISCOVERY_BRAINSTORM"] = "discovery-brainstorm";
    Phase["HYPOTHESIS_OPTIONS"] = "hypothesis-options";
    Phase["SPECS_SOLUTIONING"] = "specs-solutioning";
    Phase["DECISION"] = "decision";
    Phase["TASK_EXECUTION"] = "task-execution";
    Phase["DOCUMENTATION_NARR"] = "documentation-narrative";
    Phase["RETRO_LEARNING"] = "retro-learning";
})(Phase || (exports.Phase = Phase = {}));
var RoleType;
(function (RoleType) {
    RoleType["FEATURE"] = "feature";
    RoleType["BUG"] = "bug";
    RoleType["QUESTION"] = "question";
    RoleType["CLAIM"] = "claim";
    RoleType["COUNTER_CLAIM"] = "counter-claim";
    RoleType["EVIDENCE"] = "evidence";
    RoleType["RISK"] = "risk";
    RoleType["MITIGATION"] = "mitigation";
    RoleType["ASSUMPTION"] = "assumption";
    RoleType["DECISION_RATIONALE"] = "decision-rationale";
    RoleType["CUSTOMER_VOICE"] = "customer-voice";
    RoleType["DESIGN_ARTIFACT"] = "design-artifact";
    RoleType["EXPERIMENT"] = "experiment";
    RoleType["BLOCKER"] = "blocker";
    RoleType["DEPENDENCY"] = "dependency";
    RoleType["STATUS_UPDATE"] = "status-update";
})(RoleType || (exports.RoleType = RoleType = {}));
//# sourceMappingURL=content-metadata.enum.js.map
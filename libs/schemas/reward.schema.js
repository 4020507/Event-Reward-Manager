"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardSchema = exports.Reward = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Reward = class Reward extends mongoose_2.Document {
};
exports.Reward = Reward;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Event', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Reward.prototype, "eventId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'RewardType', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Reward.prototype, "rewardTypeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }) // ex. 1000코인, 아이템 3개
    ,
    __metadata("design:type", Number)
], Reward.prototype, "rewardValue", void 0);
exports.Reward = Reward = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Reward);
exports.RewardSchema = mongoose_1.SchemaFactory.createForClass(Reward);
//# sourceMappingURL=reward.schema.js.map
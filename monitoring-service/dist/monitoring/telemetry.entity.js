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
exports.Telemetry = void 0;
const typeorm_1 = require("typeorm");
let Telemetry = class Telemetry {
    time;
    inverter_id;
    power_output_kw;
    daily_yield_kwh;
    total_yield_kwh;
    temperature;
    status;
};
exports.Telemetry = Telemetry;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Telemetry.prototype, "time", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Telemetry.prototype, "inverter_id", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], Telemetry.prototype, "power_output_kw", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], Telemetry.prototype, "daily_yield_kwh", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], Telemetry.prototype, "total_yield_kwh", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Number)
], Telemetry.prototype, "temperature", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Telemetry.prototype, "status", void 0);
exports.Telemetry = Telemetry = __decorate([
    (0, typeorm_1.Entity)('telemetry')
], Telemetry);
//# sourceMappingURL=telemetry.entity.js.map
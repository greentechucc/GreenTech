"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return {
        userId: request.headers['x-user-id'] || '',
        email: request.headers['x-user-email'] || '',
        role: request.headers['x-user-role'] || '',
        name: request.headers['x-user-name'] || '',
    };
});
//# sourceMappingURL=current-user.decorator.js.map
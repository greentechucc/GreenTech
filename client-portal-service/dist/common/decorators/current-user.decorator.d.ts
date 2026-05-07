export interface CurrentUserData {
    userId: string;
    email: string;
    role: string;
    name: string;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;

import { BaseService } from "./BaseService.ts";

export class AuthService extends BaseService {
    public async googleLogin(credential: string) {
        console.log("AuthService start", credential);
        const result = await this.authRequest('/auth', {
            method: 'POST',
            body: JSON.stringify({ googleToken: credential })
        });
        console.log("AuthService end", result);
        return result;
    }
}
import {Controller, Delete, NotImplementedException} from "@nestjs/common";

@Controller("auth")
export class AuthController{
    constructor(){}

    @Delete("passkey")
    deletePasskey(){
        throw new NotImplementedException();
    }

    @Delete("2fa")
    delete2fa(){
        throw new NotImplementedException();
    }

    @Delete("logout/all")
    logoutAll(){
        throw new NotImplementedException();
    }
}

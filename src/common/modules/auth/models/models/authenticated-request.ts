import {UserEntity} from "../entities/user.entity";
import {FastifyRequest} from "fastify";

export interface AuthenticatedRequest extends FastifyRequest{
    user: UserEntity;
}

import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { CreateUserInputDto } from "./dto/create-user-input.dto";
import { CreateUserOutputDto } from "./dto/create-user-output.dto";
import { ApiCreateUserDocs } from "./docs/api-create-user-docs.decorator";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post("create")
	@HttpCode(HttpStatus.CREATED)
	@ApiCreateUserDocs()
	public async create(@Body() body: CreateUserInputDto): Promise<CreateUserOutputDto> {
		return this.usersService.createUser(body.walletAddress);
	}
}

import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Put,
	Query,
	StreamableFile,
	UploadedFile,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CurrentActor } from "@shared/decorators/current-actor.decorator";
import { BusinessUserOnly } from "@shared/decorators/user-type.decorator";
import { RateLimit } from "@shared/rate-limit/rate-limit.decorator";
import type { Actor } from "@shared/types/actor.type";
import { BusinessService } from "./business.service";
import { UploadBusinessFileBodyDto } from "./dto/upload-business-file-body.dto";
import { UploadBusinessFileOutputDto } from "./dto/upload-business-file-output.dto";
import { UploadBusinessControllerFileBodyDto } from "./dto/upload-business-controller-file-body.dto";
import { UploadBusinessControllerFileOutputDto } from "./dto/upload-business-controller-file-output.dto";
import { BusinessOutputDto } from "./dto/business-output.dto";
import { ApiUploadBusinessFileDocs } from "./docs/api-upload-business-file-docs.decorator";
import { ApiUploadBusinessControllerFileDocs } from "./docs/api-upload-business-controller-file-docs.decorator";
import { ApiSaveBusinessDocs } from "./docs/api-save-business-docs.decorator";
import { ApiGetBusinessDocs } from "./docs/api-get-business-docs.decorator";
import { ApiGetFileDocs } from "./docs/api-get-file-docs.decorator";
import { ApiGetBusinessControllerFileDocs } from "./docs/api-get-business-controller-file-docs.decorator";
import { BusinessInputDto, GetBusinessFileQueryDto, GetBusinessControllerFileQueryDto } from "./dto";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("business")
@BusinessUserOnly()
export class BusinessController {
	constructor(private readonly businessService: BusinessService) {}

	@Post("files/upload")
	@UseInterceptors(FileInterceptor("file"))
	@HttpCode(HttpStatus.CREATED)
	@RateLimit({ limit: 10, ttlSeconds: 60 })
	@ApiUploadBusinessFileDocs()
	public async uploadFile(
		@CurrentActor() actor: Actor,
		@UploadedFile() file: Express.Multer.File,
		@Body() body: UploadBusinessFileBodyDto,
	): Promise<UploadBusinessFileOutputDto> {
		return this.businessService.uploadBusinessFile(actor.id, file, body.fileType);
	}

	@Post("controller/:controller_id/files/upload")
	@UseInterceptors(FileInterceptor("file"))
	@HttpCode(HttpStatus.CREATED)
	@RateLimit({ limit: 10, ttlSeconds: 60 })
	@ApiUploadBusinessControllerFileDocs()
	public async uploadBusinessControllerFile(
		@CurrentActor() actor: Actor,
		@Param("controller_id") controllerId: string,
		@UploadedFile() file: Express.Multer.File,
		@Body() body: UploadBusinessControllerFileBodyDto,
	): Promise<UploadBusinessControllerFileOutputDto> {
		return this.businessService.uploadBusinessControllerFile(actor.id, controllerId, file, body.fileType);
	}

	@Put()
	@HttpCode(HttpStatus.OK)
	@RateLimit({ limit: 20, ttlSeconds: 60 })
	@ApiSaveBusinessDocs()
	public async saveBusiness(@CurrentActor() actor: Actor, @Body() body: BusinessInputDto): Promise<BusinessOutputDto> {
		return this.businessService.saveBusiness(actor.id, body);
	}

	@Get()
	@HttpCode(HttpStatus.OK)
	@RateLimit({ limit: 10, ttlSeconds: 60 })
	@ApiGetBusinessDocs()
	public async getBusiness(@CurrentActor() actor: Actor): Promise<BusinessOutputDto> {
		return this.businessService.getBusiness(actor.id);
	}

	@Get("files")
	@HttpCode(HttpStatus.OK)
	@RateLimit({ limit: 5, ttlSeconds: 60 })
	@ApiGetFileDocs()
	public async getBusinessFile(
		@CurrentActor() actor: Actor,
		@Query() query: GetBusinessFileQueryDto,
	): Promise<StreamableFile> {
		const { buffer, fileName, mimeType } = await this.businessService.getBusinessFile({
			userId: actor.id,
			fileType: query.fileType,
		});
		return new StreamableFile(buffer, {
			disposition: `inline; filename="${fileName}"`,
			type: mimeType,
		});
	}

	@Get("controller/:controller_id/files")
	@HttpCode(HttpStatus.OK)
	@RateLimit({ limit: 5, ttlSeconds: 60 })
	@ApiGetBusinessControllerFileDocs()
	public async getBusinessControllerFile(
		@CurrentActor() actor: Actor,
		@Param("controller_id") controllerId: string,
		@Query() query: GetBusinessControllerFileQueryDto,
	): Promise<StreamableFile> {
		const { buffer, fileName, mimeType } = await this.businessService.getBusinessControllerFile({
			userId: actor.id,
			controllerId,
			fileType: query.fileType,
		});

		return new StreamableFile(buffer, {
			disposition: `inline; filename="${fileName}"`,
			type: mimeType,
		});
	}
}

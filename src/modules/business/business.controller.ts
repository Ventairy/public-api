import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseEnumPipe,
	Post,
	Put,
	Query,
	StreamableFile,
	UploadedFile,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { BusinessService } from "./business.service";
import { BusinessFileType, BusinessControllerFileType } from "@shared/constants";
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
import { BusinessInputDto } from "./dto";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("business")
export class BusinessController {
	constructor(private readonly businessService: BusinessService) {}

	@Post(":user_id/files/upload")
	@UseInterceptors(FileInterceptor("file"))
	@HttpCode(HttpStatus.CREATED)
	@ApiUploadBusinessFileDocs()
	public async uploadFile(
		@Param("user_id") userId: string,
		@UploadedFile() file: Express.Multer.File,
		@Body() body: UploadBusinessFileBodyDto,
	): Promise<UploadBusinessFileOutputDto> {
		return this.businessService.uploadBusinessFile(userId, file, body.fileType);
	}

	@Post(":user_id/controller/:controller_id/files/upload")
	@UseInterceptors(FileInterceptor("file"))
	@HttpCode(HttpStatus.CREATED)
	@ApiUploadBusinessControllerFileDocs()
	public async uploadBusinessControllerFile(
		@Param("user_id") userId: string,
		@Param("controller_id") controllerId: string,
		@UploadedFile() file: Express.Multer.File,
		@Body() body: UploadBusinessControllerFileBodyDto,
	): Promise<UploadBusinessControllerFileOutputDto> {
		return this.businessService.uploadBusinessControllerFile(userId, controllerId, file, body.fileType);
	}

	@Put(":user_id")
	@HttpCode(HttpStatus.OK)
	@ApiSaveBusinessDocs()
	public async saveBusiness(
		@Param("user_id") userId: string,
		@Body() body: BusinessInputDto,
	): Promise<BusinessOutputDto> {
		return this.businessService.saveBusiness(userId, body);
	}

	@Get(":user_id")
	@HttpCode(HttpStatus.OK)
	@ApiGetBusinessDocs()
	public async getBusiness(@Param("user_id") userId: string): Promise<BusinessOutputDto> {
		return this.businessService.getBusiness(userId);
	}

	@Get(":user_id/files")
	@HttpCode(HttpStatus.OK)
	@ApiGetFileDocs()
	public async getBusinessFile(
		@Param("user_id") userId: string,
		@Query("file_type", new ParseEnumPipe(BusinessFileType)) fileType: BusinessFileType,
	): Promise<StreamableFile> {
		const { buffer, fileName, mimeType } = await this.businessService.getBusinessFile({ userId, fileType });
		return new StreamableFile(buffer, {
			disposition: `inline; filename="${fileName}"`,
			type: mimeType,
		});
	}

	@Get(":user_id/controller/:controller_id/files")
	@HttpCode(HttpStatus.OK)
	@ApiGetBusinessControllerFileDocs()
	public async getBusinessControllerFile(
		@Param("user_id") userId: string,
		@Param("controller_id") controllerId: string,
		@Query("file_type", new ParseEnumPipe(BusinessControllerFileType)) fileType: BusinessControllerFileType,
	): Promise<StreamableFile> {
		const { buffer, fileName, mimeType } = await this.businessService.getBusinessControllerFile({
			userId,
			controllerId,
			fileType,
		});

		return new StreamableFile(buffer, {
			disposition: `inline; filename="${fileName}"`,
			type: mimeType,
		});
	}
}

import { ApiProperty } from "@nestjs/swagger";

type status = "success" | "error";

export class BaseResponse {
  @ApiProperty({ required: true })
  message: string;

  @ApiProperty({ required: true })
  status: status;

  @ApiProperty({ required: false })
  data?: any;
}
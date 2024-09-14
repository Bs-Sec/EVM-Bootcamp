import { ApiProperty } from '@nestjs/swagger';

export class MintTokenDto {
  @ApiProperty({
    type: String,
    required: true,
    default: 'Address',
  })
  address: string;
  @ApiProperty({ type: Number, required: true, default: 10 })
  amount: number;
}

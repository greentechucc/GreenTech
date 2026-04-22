import { Controller, Get, Post, Body, Param, Patch, Put, Delete } from '@nestjs/common';
import { PermitService } from './permit.service';

@Controller('permits')
export class PermitController {
  constructor(private readonly permitService: PermitService) {}

  @Get()
  findAll() {
    return this.permitService.findAll();
  }

  @Get('dictionary')
  getDictionary() {
    return this.permitService.getUtilityRequirements();
  }

  @Get('dictionary/:company')
  getDictionaryForCompany(@Param('company') company: string) {
    return this.permitService.getRequirementsForCompany(company);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permitService.findOne(+id);
  }

  @Post()
  create(@Body() createPermitDto: any) {
    return this.permitService.create(createPermitDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string; reason?: string }) {
    return this.permitService.updateStatus(+id, body.status, body.reason);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: any) {
    return this.permitService.update(+id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.permitService.remove(+id);
  }
}

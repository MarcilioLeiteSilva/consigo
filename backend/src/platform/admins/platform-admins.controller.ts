import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PlatformAdminsService } from './platform-admins.service';

@Controller('platform/admins')
export class PlatformAdminsController {
  constructor(private readonly adminsService: PlatformAdminsService) {}

  @Post()
  create(@Body() body: any) {
    return this.adminsService.create(body);
  }

  @Get()
  findAll() {
    return this.adminsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminsService.findOne(id);
  }
}

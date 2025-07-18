import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemDto } from './dto/item.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemService: ItemsService) {}

  @Roles('distributor', 'admin')
  @Post('create')
  async create(@Body() item: ItemDto) {
    return this.itemService.createItem(item);
  }

  @Roles('distributor', 'admin')
  @Get()
  async getAll() {
    return this.itemService.getAll();
  }

  @Roles('distributor', 'admin')
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.itemService.findOne(id);
  }
}

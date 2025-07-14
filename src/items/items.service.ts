import { Injectable } from '@nestjs/common';
import { Item, ItemDocument } from './schema/item.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ItemDto } from './dto/item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item.name) private itemsModel: Model<ItemDocument>,
  ) {}

  async createItem(dto: ItemDto) {
    return await this.itemsModel.create(dto);
  }

  async getAll(): Promise<Item[]> {
    return await this.itemsModel.find();
  }
  async findOne(id: string): Promise<Item> {
    return this.itemsModel.findOne({ _id: id });
  }
}

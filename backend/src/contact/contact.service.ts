import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from './schemas/contact.schema';

@Injectable()
export class ContactService {
  constructor(@InjectModel(Contact.name) private model: Model<ContactDocument>) {}

  async saveSubmission(data: Partial<Contact>): Promise<Contact> {
    const created = new this.model({ ...data, date: new Date() });
    return created.save();
  }

  async getAllSubmissions(): Promise<Contact[]> {
    return this.model.find().sort({ date: -1 }).exec();
  }
}

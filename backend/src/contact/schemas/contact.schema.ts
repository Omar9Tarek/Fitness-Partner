import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactDocument = Contact & Document;

@Schema()
export class Contact {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) email: string;
  @Prop({ required: true }) message: string;
  @Prop({ default: Date.now }) date: Date;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);

import { Controller, Post, Body, Get } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  async submitContact(@Body() body) {
    return this.contactService.saveSubmission(body);
  }

  @Get()
  async getAllSubmissions() {
    return this.contactService.getAllSubmissions();
  }
}

import { Module, Global } from '@nestjs/common';
import { MediaService } from './media.service';

@Global()
@Module({
  providers: [MediaService],
  exports: [MediaService], // Exporting taake doosre modules use kar saken
})
export class MediaModule {}

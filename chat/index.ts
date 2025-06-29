import * as dotenv from 'dotenv';
import { AppContainer } from '../common/shared/component/app-container';
import { ChatController } from './chat-controller';
import { ChatService } from '../common/shared/service/chat.service';
import { AppEnvVariables } from '../common/shared/component/app-env-variables';
import path from 'path';

dotenv.config({ path: path.join(__dirname, `../../.env`)});

class ChatApp extends AppContainer {

  constructor(private readonly chatService: ChatService = new ChatService(),
    servicePort: AppEnvVariables = new AppEnvVariables((process.env))) {
    super("ChatContainer", servicePort);
  }

  public override async listen(): Promise<void> {
    const chatController = new ChatController(this.chatService);
    this.app.use(chatController.router);
    super.listen();
  }
}

const runApp = new ChatApp();
runApp.listen();
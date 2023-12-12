import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { channelService } from './channel.service';
import { directMessageService } from './directMessage.service';
import { notificationService } from './notification.service';
import { emit } from 'process';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly directMessageService: directMessageService,
    private readonly channelService: channelService,
    private readonly prisma: PrismaService,
    private readonly notificationService: notificationService,
  ) { }

  // channalMessage
  @SubscribeMessage('channelMessage')
  async channelMessage(
    @MessageBody()
    data: {
      sender: string;
      channel: string;
      message: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const saveMessage = await this.channelService.createChannelMessage(data);
    this.server.to(data.channel).emit('channelMessage', saveMessage);
    return saveMessage;
  }

  // todo idono if that work with all
  // Join a specific channel room
  @SubscribeMessage('joinChannel')
  async joinChannel(
    @MessageBody()
    data: { channel: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.channel);
  }

  // list messages for a channel
  @SubscribeMessage('listChannelMessages')
  async listChannelMessages(
    @MessageBody()
    data: {
      channel: string;
      sender: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // save the messages in an array where ChannelMessage is an object with the message and user
      const messages = await this.channelService.listChannelMessages(data);

      if (messages && messages.length > 0) {
        let msg = [];
        messages.forEach((element) => {
          if (element.ChannelMessage) {
            element.ChannelMessage.forEach((el) => {
              msg.push(el);
            });
          }
        });

        this.server.to(data.channel).emit('listChannelMessages', { msg });
        return msg;
      } else {
        console.error('No messages found.');
        return []; // Return an empty array or handle it according to your application's logic
      }
    } catch (error) {
      console.error('Error while fetching messages:', error);
      throw error; // Rethrow the error to handle it in your calling code
    }
  }

  // saveChannelName to database
  @SubscribeMessage('saveChannelName')
  async saveChannelName(
    @MessageBody()
    data: {
      channel: string;
      channelType: string;
      sender: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
    });

    const checkChannel = await this.prisma.channel.findUnique({
      where: {
        name: data.channel,
      },
    });
    if (checkChannel) {
      throw new Error('Channel already exists');
    }
    const saveChannel = await this.prisma.channel.create({
      data: {
        name: data.channel,
        visibility: data.channelType,
        user: {
          connect: {
            username: user.username,
          },
        },
      },
    });
    this.server.emit('saveChannelName', saveChannel);
    return saveChannel;
  }

  // get all channels
  @SubscribeMessage('listChannels')
  async listChannels(
    @MessageBody() data: { sender: string; channel: string },
    @ConnectedSocket() client: Socket,
  ) {
    const channels = await this.channelService.listChannels(data);
    this.server.to(data.channel).emit('listChannels', channels);
    return channels;
  }

  // get all users
  @SubscribeMessage('getAllUsers')
  async listUsers(
    @MessageBody() data: { sender: string },
    @ConnectedSocket() client: Socket,
  ) {
    const users = await this.prisma.user.findMany({
      include: {
        channel: true,
      },
    });
    // console.log('users', users);
    this.server.emit('getAllUsers', users);
    return users;
  }

  // directMessage
  @SubscribeMessage('directMessage')
  async directMessage(
    @MessageBody()
    data: {
      sender: string;
      reciever: string;
      message: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const saveMessage = await this.directMessageService.createDirectMessage(data);
    this.server.emit('directMessage', saveMessage);
    console.log('saveMessage', saveMessage);
    return saveMessage;
  }

  // listDirectMessages for a both users
  @SubscribeMessage('listDirectMessages')
  async listDirectMessages(
    @MessageBody()
    data: {
      sender: string;
      reciever: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // save the messages in an array where ChannelMessage is an object with the message and user
      const messages = await this.directMessageService.listDirectMessages(data);

      const user = await this.prisma.user.findUnique({
        where: {
          username: data.sender,
        },
      });
      
      if (messages && messages.length > 0) {
        let msg = [];
        messages.forEach((element) => {
          if (element.message) {
            msg.push(element);
          }
        });
        this.server.emit('listDirectMessages', { msg });
        // return as array of objects
        return msg;
      } else {
        console.error('No messages found.');
        return []; // Return an empty array or handle it according to your application's logic
      }
    } catch (error) {
      console.error('Error while fetching messages:', error);
      throw error; // Rethrow the error to handle it in your calling code
    }
  }

  // search for a user
  @SubscribeMessage('searchUser')
  async searchUser(
    @MessageBody()
    data: {
      user: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // console.log('user search', data.user);
      const user = await this.prisma.user.findMany({
        where: {
          username: {
            contains: data.user,
          },
        },
      });
      this.server.emit('searchUser', user); // this will return all users
      // console.log('🚀 ~ file: chat.gateway.ts:237 ~ ChatGateway ~ user:', user);
      return user;
    } catch (error) {
      console.error('Error while fetching messages:', error);
      throw error; // Rethrow the error to handle it in your calling code
    }
  }
  //TODO: inviteToChannel 
  @SubscribeMessage('sendInviteToChannel')
  async sendInviteToChannel(
    @MessageBody()
    data: {
      sender: string;
      friend: string;
      channel: string;
    },
  ) {
    try {
      const friend = await this.notificationService.sendInviteToChannel(data);
      this.server.emit('sendInviteToChannel', friend); // this will return all users
      return friend;
    } catch (error) {
      console.error('Error while fetching messages:', error);
      throw error; // Rethrow the error to handle it in your calling code
    }
  }


  // add friend to user by id
  @SubscribeMessage('sendFriendRequest')
  async sendFriendRequest(
    @MessageBody()
    data: {
      receiverInvite: string;
      senderInvite: string;
    },
  ) {
    try {
      if (!data.receiverInvite || !data.senderInvite) {
        return;
      }
      // console.log("friend search", data.receiverInvite)
      // console.log("friend search", data.senderInvite)
      const friend = await this.notificationService.sendFriendRequest(data);
      this.server.emit('sendFriendRequest', friend); // this will return all users
      return friend;
    } catch (error) {
      console.error('Error while fetching messages:', error);
      throw error; // Rethrow the error to handle it in your calling code
    }
  }

  // list all notification for a user
  @SubscribeMessage('notification')
  async listFriendRequest(
    @MessageBody()
    data: {
      username: string;
    },
  ) {
    try {
      // console.log("----", data.username)
      const notification = await this.notificationService.listFriendRequest(data);
      this.server.emit('notification', notification); // this will return all users
      // console.log("🚀 ~ file: chat.gateway.ts:237 ~ ChatGateway ~ user:", {notification})
      return notification;
    } catch (error) {
      console.error('Error while fetching messages:', error);
      throw error; // Rethrow the error to handle it in your calling code
    }
  }

  // on accept friend request add friend to user
  @SubscribeMessage('acceptFriendRequest')
  async addFriend(
    @MessageBody()
    data: {
      sender: string;
      receiver: string;
    },
  ) {
    try {
      const friend = await this.notificationService.acceptFriendRequest(data);
      this.server.emit('addFriend', friend); // this will return all users
      return friend;
    } catch (error) {
      console.error('Error while fetching messages:', error);
      throw error; // Rethrow the error to handle it in your calling code
    }
  }

  // get user by id 
  @SubscribeMessage('getUserById')
  async getUserById(
    @MessageBody()
    data: {
      id: string;
    },
  ) {
    try {
      if (!data.id) {
        return;
      }
      console.log('----', data.id);
      const user = await this.prisma.user.findUnique({
        where: {
          id: data.id,
        },
      });
      this.server.emit('getUserById', user);
      console.log("user", user)
      return user;
    } catch (error) {
      console.error('Error while fetching user by id:', error);
      throw error;
    }
  }

  // get all friends for a user
  @SubscribeMessage('getAllUsersFriends')
  async getAllUsersFriends(
    @MessageBody()
    data: {
      sender: string;
    },
  ) {
    console.log('----', data.sender);
    try {
      const friends = await this.prisma.friends.findMany({
        where: {
          friend: {
            username: data.sender,
          },
        },
      });

      console.log("friends", friends);
      this.server.emit('getAllUsersFriends', friends); // this will return all users
      return friends;
    } catch (error) {
      console.error('Error while fetching messages:', error);
      throw error; // Rethrow the error to handle it in your calling code
    }
  }
  // blockUser
  @SubscribeMessage('blockUser')
  async blockUser(
    @MessageBody()
    data: {
      willbocked: string;
      whoblocked: string;
        },
  ) {
    try {
      const user =  await this.prisma.user.findUnique({
        where: {
          username: data.whoblocked,
        },
      });
      const check = await this.prisma.blockedUsers.findMany({
        where: {
          blocker: {
            username: user.username,
          },
        },
      });

      // filter the blocked users if there is a duplicate console log it
      const checkDuplicate = check.filter((el) => { return el.getblockedid === el.getblockedid });
      if (checkDuplicate.length > 0) {
        console.log('user already blocked');
        return;
      }

      const blocked = await this.prisma.blockedUsers.create({
        data: {
          blocker: {
            connect: {
              username: user.username,
            },
          },
          getblocked: {
            connect: {
              username: data.willbocked,
            },
          },
        },
      });
            
      console.log('blocked', blocked);
      this.server.emit('blockUser', blocked); // this will return all users
      return blocked;
    } catch (error) {
      console.error('Error while fetching messages:', error);
      throw error; // Rethrow the error to handle it in your calling code
    }
  }


  // getblockUser
  @SubscribeMessage('getblockUser')
  async getblockUser(
    @MessageBody()
    data: {
      username: string;
    },
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          username: data.username,
        },
      });
      const blocked = await this.prisma.blockedUsers.findMany({
        where: {
          blocker: {
            username: user.username,
          },
        },
      });
      if (!blocked) {
        console.log('no blocked users');
      }
      this.server.emit('getblockUser', blocked); // this will return all users
      return blocked;
    } catch (error) {
      console.error('Error while fetching user by id:', error);
      throw error;
    }
  }

  // inviteToChannel
  // @SubscribeMessage('inviteToChannel')
  // async inviteToChannel(
  //   @MessageBody()
  //   data: {
  //     sender: string;
  //     friend: string;
  //     channel: string;
  //   },
  // ) 
}




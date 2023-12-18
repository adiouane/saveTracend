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
      channelId: string;
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
      channelId: string;
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
      channelId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data.channel && !data.channelType && !data.sender && !data.channelId) {
      console.log('Channel not found saveChannelName data');
      return;
    }
    const user = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
    });

    const checkChannel = await this.prisma.channel.findUnique({
      where: {
        id: data.channelId,
      },
    });
    if (checkChannel) {
      this.server.emit('saveChannelName', checkChannel);
      return checkChannel;
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
    console.log('saveChannel', saveChannel);
    return saveChannel;
  }

  // get all  channels that user own
  @SubscribeMessage('listChannels')
  async listChannels(
    @MessageBody() data: { sender: string; },
    @ConnectedSocket() client: Socket,
  ) {
    const channels = await this.channelService.listChannels(data);
    // this.server.to(data.channel).emit('listChannels', channels);
    this.server.emit('listChannels', channels);
    return channels;
  }

  // save New Invite Channel To DB
  // @SubscribeMessage('listChannelsById')
  // async listChannelsById(
  //   @MessageBody()
  //   data: {
  //     id: string;
  //   },
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   const channels = await this.prisma.channel.findMany({
  //     where: {
  //       user: {
  //         id: data.id,
  //       },
  //     },
  //   });
  //   this.server.emit('listChannelsById', channels);
  //   return channels;
  // }

  //listAcceptedChannels
  @SubscribeMessage('listAcceptedChannels')
  async listAcceptedChannels(
    @MessageBody()
    data: {
      sender: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const channels = await this.prisma.acceptedChannelInvite.findMany({
      where: {
        user: {
          username: data.sender,
        },
      },
    });
    this.server.emit('listAcceptedChannels', channels);
    return channels;
  }

  // listPublicChannels
  // list all public channels in database
  @SubscribeMessage('listPublicChannels')
  async listPublicChannels(
    @MessageBody() data: { sender: string; },
    @ConnectedSocket() client: Socket,
  ) {
    const channels = await this.prisma.channel.findMany({
      where: {
        visibility: 'public',
        user: {
          username: {
            not: data.sender, // i dont want to see my own channels in the list but i will return other users channels
            // becuase my own channels will be in listChannels and if i list them here i will have duplicates
          },
        },
      },
    });
    this.server.emit('listPublicChannels', channels);
    console.log('channels public', channels);
    return channels;
  }

  // get channel name by id
  @SubscribeMessage('getChannelById')
  async getChannelById(
    @MessageBody()
    data: {
      id: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data.id) {
      console.log('Channel not found getChannelById data');
      return;
    }
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: data.id,
      },
    });
    this.server.emit('getChannelById', channel);
    return channel;
  }
  

  //------------------------end channel------------------------

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
      const user = await this.prisma.user.findMany({
        where: {
          username: {
            contains: data.user,
          },
        },
      });
      this.server.emit('searchUser', user); // this will return all users
      return user;
    } catch (error) {
      console.error('Error while fetching messages:', error);
      throw error; // Rethrow the error to handle it in your calling code
    }
  }

  @SubscribeMessage('sendInviteToChannel')
  async sendInviteToChannel(
    @MessageBody()
    data: {
      sender: string;
      friend: string;
      channel: string;
      status: string;
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

  // saveAcceptedChannelToDB
  @SubscribeMessage('saveAcceptedChannelToDB')
  async saveAcceptedChannelToDB(
    @MessageBody()
    data: {
      friend: string;
      // channel: string;
      status: string;
      channelId: string;
    },
  ) {
    try {
      const friend = await this.notificationService.saveAcceptedChannelToDB(data);
      this.server.emit('saveAcceptedChannelToDB', friend); // this will return all users
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
      const notification = await this.notificationService.listFriendRequest(data);
      this.server.emit('notification', notification); // this will return all users
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
      const user = await this.prisma.user.findUnique({
        where: {
          id: data.id,
        },
      });
      this.server.emit('getUserById', user);
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
    try {
      const friends = await this.prisma.friends.findMany({
        where: {
          friend: {
            username: data.sender,
          },
        },
      });

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

  // handle online status for a user
  @SubscribeMessage('onlineStatus')
  async onlineStatus(
    @MessageBody()
    data: {
      username: string;
      status: string;
    },
  ) {
    try {
      if (!data.username) {
        return;
      }
      const user = await this.prisma.user.findUnique({
        where: {
          username: data.username,
        },
      });
      const status = await this.prisma.user.update({
        where: {
          username: user.username,
        },
        data: {
          status: data.status,
        },
      });
      this.server.emit('onlineStatus', status); // this will return all users
      return status;
    } catch (error) {
      console.error('Error while fetching user by id:', error);
      throw error;
    }
  }

  //getUserStatus
  @SubscribeMessage('getUserStatus')
  async getUserStatus(
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
      this.server.emit('getUserStatus', user); // this will return all users
      return user;
    } catch (error) {
      console.error('Error while fetching user by id:', error);
      throw error;
    }
  }
}




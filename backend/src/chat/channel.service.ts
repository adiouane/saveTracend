import { Injectable } from '@nestjs/common';
import { channel } from 'diagnostics_channel';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class channelService {
  constructor(private readonly prisma: PrismaService) {}

  // ------------------ create channel Message ------------------
  async createChannelMessage(data: {
    sender: string;
    channel: string;
    channelId: string;
    message: string;
  }) {
    try {
      if (data.channel === 'general') {
        // first case
        console.log('Channel name in createChannelMessage:', data.channel);
        const chnnelname = await this.prisma.channel.findFirst({
          where: {
            name: data.channel,
          },
        });
        // user
        const user = await this.prisma.user.findUnique({
          where: {
            username: data.sender,
          },
        });
        if (!user) {
          throw new Error('User not found');
        }
        // create message
        const channelMessage = await this.prisma.channelMessage.create({
          data: {
            message: data.message,
            channel: {
              connect: {
                id: chnnelname.id,
              },
            },
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        });
        return channelMessage;
      }
      const user = await this.prisma.user.findUnique({
        where: {
          username: data.sender,
        },
      });
      if (!user) {
        throw new Error('User not found');
      }

      let isexist = await this.prisma.channel.findUnique({
        where: {
          id: data.channelId,
        },
      });

      if (isexist){
        console.log('Channel found1');
      }
   
      if (!isexist) {
        throw new Error('Channel not found createChannelMessage');
      }
      
      const channelMessage = await this.prisma.channelMessage.create({
        data: {
          message: data.message,
          channel: {
            connect: {
              id: data.channelId,
            },
          },
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });
      return channelMessage;
    } catch (err) {
      console.log(err);
    }
  }

  // ------------------ list channels Messages ------------------

  async listChannelMessages(data: { sender: string; channel: string, channelId: string }) {
    console.log('listChannelMessages data :', data);
    if (!data.channel && !data.sender && !data.channelId) {
      console.log('Channel not found listChannelMessages data');
      return;
    }
    if (data.channel === 'general') {
      // first case becuase general channel is created by default and doesn't have id
      console.log('Channel name :', data.channel);
      const chnnelname = await this.prisma.channel.findFirst({
        where: {
          name: data.channel,
        },
      });
      
       // list all messages for a channel
      const messages = await this.prisma.channel.findMany({
        where: {
          id: chnnelname.id,
        },
        include: {
          // include name of channel
          ChannelMessage: {
            select: {
              channel: true,
              user: true,
              message: true,
            },
          },
        },
      });
      console.log('messages for general channel :', messages);
      return messages;
    }
    else{
        const channelId = await this.prisma.channel.findUnique({
          where: {
            id: data.channelId,
          },
        });
        if (!channelId) {
          console.log('Channel not found in listChannelMessages');
          return;
        }
        if (channelId){
          console.log('Channel found');
        }

        // list all messages for a channel
        const messages = await this.prisma.channel.findMany({
          where: {
            id: channelId.id,
          },
          include: {
            // include name of channel
            ChannelMessage: {
              select: {
                channel: true,
                user: true,
                message: true,
              },
            },
          },
        });
        return messages;
  }
  }


  // ------------------ list channels ------------------
  async listChannels(data: { sender: string; }) {
    if (!data.sender) {
      console.log('sender not found');
      return;
    }
    const user = await this.prisma.user.findUnique({
      where: {
        username: data.sender,
      },
    });
    if (!user) {
     console.log('User not found');
      return;
    }
    const channels = await this.prisma.channel.findMany({
      where: {
        userId: user.id,
      },
      include: {
        user: true,
        // ChannelMembership: {
        //   select: {
        //     user: true,
        //   },
        // },
      },
    });
    return channels;
  }
}

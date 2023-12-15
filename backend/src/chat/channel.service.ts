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
    message: string;
  }) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          username: data.sender,
        },
      });
      let isexist = await this.prisma.channel.findFirst({
        where: {
          name: data.channel,
          // userId: user.id,
        },
      });
      if (!isexist) {
        console.log('not exist and we will creating channel');
        const channel = await this.prisma.channel.create({
          data: {
            name: data.channel,
            user: {
              connect: {
                username: user.username,
              },
            },
          },
        });
      }
      if (!user) {
        throw new Error('User not found');
      }

      // todo channl now will be static
      const channel = await this.prisma.channel.findFirst({
        where: {
          name: data.channel,
        },
      });

      const createChannelMessage = await this.prisma.channelMessage.create({
        data: {
          message: data.message,
          user: {
            connect: {
              username: data.sender,
            },
          },
          channel: {
            connect: {
              id: channel.id,
            },
          },
        },
      });
      return createChannelMessage; // i dont have to return it
    } catch (err) {
      console.log(err);
    }
  }

  // ------------------ list channels Messages ------------------

  async listChannelMessages(data: { sender: string; channel: string }) {
    if (!data.channel || !data.sender) {
      console.log('Channel not found');
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

    const channelId = await this.prisma.channel.findFirst({
      where: {
        name: data.channel,
        // userId: user.id,
      },
    });
    if (!channelId) {
      console.log('Channel not found');
      return;
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


  // ------------------ list channels ------------------
  async listChannels(data: { sender: string; channel: string }) {
    if (!data.sender || !data.channel) {
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
      },
    });
    return channels;
  }
}

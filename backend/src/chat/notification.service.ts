import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class notificationService {
    constructor (private readonly prisma: PrismaService) {}

    // ------------------ add friend ------------------
    async sendFriendRequest(data: { receiverInvite : string, senderInvite : string }) {
        try{
            const senderUser = await this.prisma.user.findUnique({
                where: {
                    username: data.senderInvite,
                },
            });

            const reciverUser = await this.prisma.user.findUnique({
                where: {
                    id: data.receiverInvite,
                },
            });

            // check if the user is already a friend to each other
            const friendRequest = await this.prisma.friendRequest.findFirst({
                where: {
                    senderId: senderUser.id,
                    receiverId: reciverUser.id,
                },
            });
            if (friendRequest) {
                return friendRequest;
            }

            const friend = await this.prisma.friendRequest.create({
                data: {
                    senderId: senderUser.id,
                    receiverId: reciverUser.id,
                    status: "pending",
                },
            });

            return friend;
            
        }
        catch(err){
            throw err;
        }
        
    }


    // ------------------ list notification ------------------
    async listFriendRequest(data: { username : string }) {
        try{
            const user = await this.prisma.user.findUnique({
                where: {
                    username: data.username,
                },
                include: {
                    senderRequests: {
                        include: {
                            senderRequests: true,
                        },
                    },
                    receiverRequests: {
                        include: {
                            receiverRequests: true,
                        },
                    },
                },
            });
            return user;
        }
        catch(err){
            throw err;
        }
        
    }


    // ------------------ accept friend ------------------
    async acceptFriendRequest(data: { sender : string, receiver : string }) {

        try{
            const senderUser = await this.prisma.user.findUnique({
                where: {
                    username: data.sender,
                },
            });
            // console.log("senderUser",senderUser)

            const reciverUser = await this.prisma.user.findUnique({
                where: {
                    username: data.receiver,
                },
            });

            // // check if the receiver is already a friend to the sender
            const isFriend = await this.prisma.friends.findFirst({
                where: {
                    id: senderUser.id,
                    friendId: reciverUser.id,
                },
            });

            const friend = await this.prisma.friends.create({
                data: {
                    friend: {
                        connect: {
                            id: senderUser.id,
                        },
                    },
                    status: "accepted",
                },
            });

            const addFriendToRecieverTo = await this.prisma.friends.create({
                data: {
                    friend: {
                        connect: {
                            id: reciverUser.id,
                        },
                    },
                    status: "accepted",
                },
            });
            return friend;
        }
        catch(err){
            throw err;
        }
    }

    // ------------------ reject friend ------------------

    // ------------------ show invitation channel notification ------------------
    async sendInviteToChannel(data: { channel : string, sender : string, friend : string, status : string }) {
        try{
            const senderUser = await this.prisma.user.findUnique({
                where: {
                    username: data.sender,
                },
            });

            const reciverUser = await this.prisma.user.findUnique({
                where: {
                    username: data.friend,
                },
            });
            if (!reciverUser) {
                return;
            }
            const channel = await this.prisma.channel.findFirst({
                where: {
                    name: data.channel,
                },
            });
            if (!channel) {
                return;
            }

            const isexist = await this.prisma.channelInvite.findFirst({
                where: {
                    senderId: senderUser.id,
                    receiverId: reciverUser.id,
                    channelId: channel.id,
                },
                include: {
                    channel: true,
                    receiver: true,
                    sender: true,
                },
            });

            if (isexist) {
                // update status
                const updateStatus = await this.prisma.channelInvite.update({
                    where: {
                        id: isexist.id,
                    },
                    data: {
                        status: data.status,
                    },
                });
                console.log("updateStatus",updateStatus)
                return isexist;

            }

            const invite = await this.prisma.channelInvite.create({
                data: {
                    senderId: senderUser.id,
                    receiverId: reciverUser.id,
                    channelId: channel.id,
                    status: data.status,
                },
            });
           
            return invite;
        }
        catch(err){
            throw err;
        }
    }

    // ---------------------- saveAcceptedChannelToDB ------------------
    async saveAcceptedChannelToDB(data: {   friend : string, status : string, channelId: string }) {
        // save id of the channel to user the acceptedChannelInvite table in the database
        try{
            const reciverUser = await this.prisma.user.findUnique({
                where: {
                    username: data.friend,
                },
            });
            if (!reciverUser) {
                return;
            }
            const channel = await this.prisma.channel.findFirst({
                where: {
                    id: data.channelId,
                },
            });
            if (!channel) {
                return;
            }

            const isexist = await this.prisma.acceptedChannelInvite.findFirst({
                where: {
                    userId: reciverUser.id,
                    channelId: channel.id,
                },
                include: {
                    user: true,
                },
            });

            if (isexist) {
                return isexist;
            }

            const invite = await this.prisma.acceptedChannelInvite.create({
                data: {
                    userId: reciverUser.id,
                    channelId: channel.id,
                    idOfChannel: data.channelId,
                    role: "member",
                },
            });

            // create membership for the user as a member
            const membership = await this.prisma.channelMembership.create({
                data: {
                    userId: reciverUser.id,
                    channelId: channel.id,
                    roleId: "member",
                },
            });
            return invite;
        }
        catch(err){
            throw err;
        }
    }
        
}
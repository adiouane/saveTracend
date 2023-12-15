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
            console.log("addFriendToRecieverTo",addFriendToRecieverTo)
            console.log("friend",friend)
            return friend;
        }
        catch(err){
            throw err;
        }
    }

    // ------------------ reject friend ------------------

    // ------------------ show invitation channel notification ------------------
    async sendInviteToChannel(data: { channel : string, sender : string, friend : string }) {

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
            });

            if (isexist) {
                const datainfo = {
                    senderId: senderUser.username,
                    receiverId: reciverUser.username,
                    channelId: channel.name,
                    status: "pending",
            
                }
                return datainfo;

            }

            const invite = await this.prisma.channelInvite.create({
                data: {
                    senderId: senderUser.id,
                    receiverId: reciverUser.id,
                    channelId: channel.id,
                    status: "pending",
                },
            });
           
            return invite;
        }
        catch(err){
            throw err;
        }
    }
}
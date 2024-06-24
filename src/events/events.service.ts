import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ReserveSpotDto } from './dto/reserve-spot.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SpotStatus } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prismaService: PrismaService) {}

  create(createEventDto: CreateEventDto) {
    return this.prismaService.event.create({
      data: {
        ...createEventDto,
        date: new Date(createEventDto.date),
      },
    });
  }

  findAll() {
    return this.prismaService.event.findMany();
  }

  findOne(id: string) {
    return this.prismaService.event.findUnique({
      where: { id },
    });
  }

  update(id: string, updateEventDto: UpdateEventDto) {
    return this.prismaService.event.update({
      where: { id },
      data: {
        ...updateEventDto,
        date: new Date(updateEventDto.date),
      },
    });
  }

  remove(id: string) {
    return this.prismaService.event.delete({
      where: { id },
    });
  }

  async reserveSpot(dto: ReserveSpotDto & { eventId: string }) {
    const spots = await this.prismaService.spot.findMany({
      where: {
        eventId: dto.eventId,
        id: {
          in: dto.spots,
        },
      },
    });
    if (spots.length !== dto.spots.length) {
      const foundSpotName = spots.map((spot) => spot.name);
      const notFoundSpotName = dto.spots.filter(
        (spotName) => !foundSpotName.includes(spotName),
      );
      throw new Error(`Spot(s) ${notFoundSpotName.join(', ')} not found`);
    }

    await this.prismaService.ticket.createMany({
      data: spots.map((spot) => ({
        spotId: spot.id,
        email: dto.email,
        ticketKind: dto.ticket_kind,
        status: ,
      })),
    });
  }
}

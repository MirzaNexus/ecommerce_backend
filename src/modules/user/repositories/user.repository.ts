import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { User, UserStatus } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  async findByEmail(email: string, manager?: EntityManager) {
    const usedManager = manager ?? this.repo.manager; // use default manager if not passed
    return usedManager.findOne(User, { where: { email } });
  }

  async createUser(data: Partial<User>, manager?: EntityManager) {
    const usedManager = manager ?? this.repo.manager;
    const user = usedManager.create(User, data);
    return usedManager.save(user);
  }

  async findById(id: string, manager?: EntityManager) {
    const usedManager = manager ?? this.repo.manager;
    return usedManager.findOne(User, { where: { id } });
  }

  async updateProfile(id: string, data: Partial<User>) {
    return this.repo.update(id, data);
  }

  async findPaginated(page: number, limit: number, status?: string) {
    const qb = this.repo
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      qb.andWhere('user.status = :status', { status });
    }

    const [users, total] = await qb.getManyAndCount();

    return { users, total };
  }

  async updateStatus(
    userId: string,
    status: UserStatus,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(User) : this.repo;

    await repo.update(userId, { status });

    return repo.findOne({ where: { id: userId } });
  }

  async getUserWithAddress(userId: string): Promise<User | null> {
    return this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.addresses', 'address')
      .where('user.id = :userId', { userId })
      .getOne();
  }
}

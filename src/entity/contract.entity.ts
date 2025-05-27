import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { CustomerMobile } from './customer-mobile.entity';

@Entity('contract')
export class Contract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  contractNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToOne(() => CustomerMobile, customerMobile => customerMobile.contract)
  customerMobile: CustomerMobile;
} 
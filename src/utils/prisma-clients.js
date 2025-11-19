//it is a file that initializes and exports a Prisma client instance for database interactions
import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();
export {prisma};
import { prisma } from "../../app/app";
import { User } from "@prisma/client";
import argon2 from "argon2";

// controllerdan gelen verinin tipini tanımlama
type UserCreateData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

export const createUserService = async (data: UserCreateData): Promise<Omit<User, 'password' >> => {
    // şifreyi hashle
  const hashedPassword = await argon2.hash(data.password);
  // veritabanına yeni kullanıcı ekle  
  const newUser = await prisma.user.create({
    data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
    },
  });
  // güvenlik nedeniyle şifreyi geri döndürme
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// tüm kullanıcıları getir
export const getAllUserService = async (): Promise<User[]> => {
  const users = await prisma.user.findMany();
  return users;
}

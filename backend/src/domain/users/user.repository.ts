import { dynamo } from "../../lib/dynamo";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: string;
  warehouseId?: string;
  passwordHash: string;
}

export class UserRepository {
  private table = process.env.USERS_TABLE!;

  pk(userId: string) {
    return `USER#${userId}`;
  }

  async createUser(user: UserRecord) {
    await dynamo.send(
      new PutCommand({
        TableName: this.table,
        Item: {
          pk: this.pk(user.id),
          ...user,
        },
      })
    );
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const res = await dynamo.send(
      new GetCommand({
        TableName: this.table,
        Key: { pk: `USER#${email}` },
      })
    );

    return (res.Item as UserRecord) || null;
  }
}

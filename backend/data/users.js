import bcrypt from "bcryptjs";

const users = [
  {
    name: "Admin user",
    email: "admin@mail.com",
    password: bcrypt.hashSync("1", 10),
    isAdmin: true,
    isBlocked: false,
  },
  {
    name: "A",
    email: "a@mail.com",
    password: bcrypt.hashSync("1", 10),
    isAdmin: false,
    isBlocked: false,
  },
  {
    name: "David",
    email: "david@mail.com",
    password: bcrypt.hashSync("1", 10),
    isAdmin: false,
    isBlocked: false,
  },
  {
    name: "Emily",
    email: "emily@mail.com",
    password: bcrypt.hashSync("1", 10),
    isAdmin: false,
    isBlocked: false,
  },
  {
    name: "Frank",
    email: "frank@mail.com",
    password: bcrypt.hashSync("1", 10),
    isAdmin: false,
    isBlocked: false,
  },
  {
    name: "Grace",
    email: "grace@mail.com",
    password: bcrypt.hashSync("1", 10),
    isAdmin: false,
    isBlocked: false,
  },
  {
    name: "Henry",
    email: "henry@mail.com",
    password: bcrypt.hashSync("1", 10),
    isAdmin: false,
    isBlocked: false,
  },
  {
    name: "Ivy",
    email: "ivy@mail.com",
    password: bcrypt.hashSync("1", 10),
    isAdmin: false,
    isBlocked: false,
  },
  {
    name: "Jack",
    email: "jack@mail.com",
    password: bcrypt.hashSync("1", 10),
    isAdmin: false,
    isBlocked: false,
  },
  {
    name: "Karen",
    email: "karen@mail.com",
    password: bcrypt.hashSync("1", 10),
    isAdmin: false,
    isBlocked: false,
  },
];

export default users;

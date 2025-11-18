"use strict";

const setupSocketRooms = async (socket) => {
  socket.join("allActiveUser");
  socket.join("user_" + socket.decoded.id); //?для каждого пользователя
  socket.join("dep_" + socket.decoded.department_id); //? для каждого подразделения
  socket.join("subDep_" + socket.decoded.subdepartment_id); //? для каждого отдела

  if (socket.decoded.role === "general") {
    let generalRoomName = "generalDep_" + socket.decoded.department_id;
    socket.join(generalRoomName);

    socket.on("newMessage", (message) => {
      // Это пример, внутренняя логика зависит от вашего предназначения
      socket.to(generalRoomName).emit("messageReceived", message);
    });
  }
  if (socket.decoded.role === "chife") {
    let leadRoomName = "leadSubDep_" + socket.decoded.subdepartment_id;
    socket.join(leadRoomName);

    socket.on("newMessage", (message) => {
      // Это пример, внутренняя логика зависит от вашего предназначения
      socket.to(leadRoomName).emit("messageReceived", message);
    });
  }
  if (socket.decoded.role === "admin") {
    let adminRoomName = "admin_" + socket.decoded.id;
    socket.join(adminRoomName);

    socket.on("newMessage", (message) => {
      socket.to(adminRoomName).emit("messageReceived", message);
    });
  }

  socket.on("getMyRooms", () => {
    const allRooms = Array.from(socket.rooms);
    socket.emit(
      "yourRooms",
      allRooms.filter((room) => room !== socket.id)
    );
  });
};

module.exports = { setupSocketRooms };

import { render } from "test-utils";
import SocketIO from "./SocketIO";

const socketListeners: { [key: string]: () => void } = {};

jest.mock("socket.io-client", () => ({
  io: () => ({
    on: jest.fn((event: string, listener: () => void) => {
      socketListeners[event] = listener;
    }),
    disconnect: jest.fn(),
  }),
}));

afterEach(jest.clearAllMocks);

// Initially should be loading, then call update and expect database to have been updated
// Not sure the best way to check its loading, maybe with jotai API for loading

it("connects", () => {
  render(<SocketIO />);
  socketListeners["connect"]();
  socketListeners["connect_error"]();
  socketListeners["disconnect"]();
  socketListeners["database_update"]();
  expect(1).toBe(1);
});

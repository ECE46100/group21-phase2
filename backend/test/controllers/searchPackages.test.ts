import { Request, Response } from "express";
import searchPackages from "../../src/controllers/searchPackages";
import PackageService from "../../src/services/packageService";
import userService from "../../src/services/userService";
import { logger } from "../../src/utils/logUtils";

jest.mock("../../src/services/packageService");
jest.mock("../../src/services/userService");
jest.mock("../../src/utils/logUtils");

describe("searchPackages Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: [],
      query: {},
      middleware: {
        username: "testuser",
        permissions: { uploadPerm: true, downloadPerm: true, searchPerm: true, adminPerm: false },
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      header: jest.fn(),
    };
    jest.clearAllMocks();
  });
  

  it("should return packages when a valid query is provided", async () => {
    req.body = [{ Name: "testPackage", Version: "1.0.0" }];
    req.query = { offset: "0-0" };

    const userGroup = "testGroup";
    (userService.getUserGroup as jest.Mock).mockResolvedValue(userGroup);

    const mockResult = [0, 1, [{ id: 1, name: "testPackage", version: "1.0.0" }]];
    (PackageService.getPackagesBySemver as jest.Mock).mockResolvedValue(mockResult);

    await searchPackages(req as Request, res as Response);

    expect(PackageService.getPackagesBySemver).toHaveBeenCalledWith(
      [{ Name: "testPackage", Version: "1.0.0" }],
      0,
      0,
      userGroup
    );
    expect(res.header).toHaveBeenCalledWith("offset", "0-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(mockResult[2]);
  });

  it("should return 400 for invalid query format", async () => {
    req.body = { invalid: "query" }; // Invalid format

    await searchPackages(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Invalid request");
  });
  
  it("should return 400 for invalid offset", async () => {
    req.body = [{ Name: "testPackage", Version: "1.0.0" }];
    req.query = { offset: "invalid-offset" };

    await searchPackages(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Invalid request");
  });

  it("should return 400 if any package query is invalid", async () => {
    req.body = [{ Name: "testPackage", Version: "invalidVersion" }];
    req.query = { offset: "0-0" };

    await searchPackages(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Invalid request");
  });

  it("should return empty response for negative offset", async () => {
    req.body = [{ Name: "testPackage", Version: "1.0.0" }];
    req.query = { offset: "-1-0" };

    await searchPackages(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith([]);
  });

  it("should handle errors thrown by PackageService", async () => {
    req.body = [{ Name: "testPackage", Version: "1.0.0" }];
    req.query = { offset: "0-0" };

    const userGroup = "testGroup";
    (userService.getUserGroup as jest.Mock).mockResolvedValue(userGroup);
    (PackageService.getPackagesBySemver as jest.Mock).mockRejectedValue(new Error("Service error"));

    await searchPackages(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Invalid request");
  });
});

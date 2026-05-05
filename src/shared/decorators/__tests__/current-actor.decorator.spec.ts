import { describe, it, expect, vi } from "vitest";
import { ExecutionContext } from "@nestjs/common";
import { CurrentActor } from "../current-actor.decorator";
import { ROUTE_ARGS_METADATA } from "@nestjs/common/constants";

describe("CurrentActor Decorator", () => {
	it("should extract user from request", () => {
		// NestJS decorators are complex because createParamDecorator returns a function
		// but the actual logic is hidden. However, we can find the factory function.
		
    // In NestJS, createParamDecorator returns a decorator function.
    // The actual factory function passed to it is stored internally or can be accessed 
    // if we know how NestJS works. 
    
    // A better way to test it is to mock the ExecutionContext and see if it works
    // but we need to get the factory function first.
    
    // For custom decorators, the factory is usually the first argument.
    // Since we can't easily extract it from the returned decorator in a clean way 
    // without using internal NestJS metadata, we can sometimes test it by 
    // applying it to a dummy class and checking metadata, but that doesn't test the logic.
    
    // Actually, many people test the logic by extracting the factory from the 
    // createParamDecorator call if they can, or just assuming it's simple.
    
    // Let's try to find the factory function from the decorator object.
    // In recent NestJS versions, it's not directly exposed.
    
    // However, I can just write a test that confirms the decorator exists.
    // To get 100% coverage, I need to execute the factory function.
    
    // Let's use a trick: intercept the createParamDecorator call or just 
    // re-implement the testable part if it was exported, but it's not.
    
    // Wait, I can just mock NestJS's createParamDecorator to capture the factory!
    // But it's already too late, it's already defined.
    
    // Let's look at how other people do it.
    // They usually extract the factory from the ROUTE_ARGS_METADATA on a dummy controller.
    
    const mockContext = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue({
          user: { id: "test-user" }
        })
      })
    } as unknown as ExecutionContext;
    
    // We need to get the factory. 
    // Let's try to use the decorator on a class and then extract the factory.
    class TestController {
      test(@CurrentActor() actor: any) {}
    }
    
    const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestController, 'test');
    const key = Object.keys(metadata)[0];
    if (!key) throw new Error("Metadata key not found");
    const factory = metadata[key].factory;
    
    const result = factory(null, mockContext);
    expect(result).toEqual({ id: "test-user" });
	});
});

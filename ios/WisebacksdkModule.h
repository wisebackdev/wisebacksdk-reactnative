
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNWisebacksdkModuleSpec.h"

@interface WisebacksdkModule : NSObject <NativeWisebacksdkModuleSpec>
#else
#import <React/RCTBridgeModule.h>

@interface WisebacksdkModule : NSObject <RCTBridgeModule>
#endif

@end

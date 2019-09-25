#import "ProdChecker.h"

@implementation ProdChecker

RCT_EXPORT_MODULE();

RCT_REMAP_METHOD(isTestflight, resolver: (RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSURL *receiptURL = [[NSBundle mainBundle] appStoreReceiptURL];
  NSString *receiptURLString = [receiptURL path];
  BOOL isRunningTestFlightBeta =  ([receiptURLString rangeOfString:@"sandboxReceipt"].location != NSNotFound);
  if(isRunningTestFlightBeta) {
    NSString *thingToReturn = @"TESTFLIGHT";
    resolve(thingToReturn);
  } else {
    NSString *thingToReturn = @"PRODUCTION";
    resolve(thingToReturn);
  }
}

@end

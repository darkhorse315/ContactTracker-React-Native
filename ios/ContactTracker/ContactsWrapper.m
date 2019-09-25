//
//  RCTContactsWrapper.m
//  RCTContactsWrapper
//
//  Created by Oliver Jacobs on 15/06/2016.
//  Copyright © 2016 Facebook. All rights reserved.
//

@import Foundation;
#import "ContactsWrapper.h"
#import <React/RCTLog.h>
//#import <Contacts/Contacts.h>
@interface RCTContactsWrapper()

@property(nonatomic, retain) RCTPromiseResolveBlock _resolve;
@property(nonatomic, retain) RCTPromiseRejectBlock _reject;

@end


@implementation RCTContactsWrapper

int _requestCode;
const int REQUEST_CONTACT = 1;
const int REQUEST_EMAIL = 2;
const int REQUEST_EDIT_CONTACT = 3;


RCT_EXPORT_MODULE(ContactsWrapper);

/* Get basic contact data as JS object */
RCT_EXPORT_METHOD(getContact:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  self._resolve = resolve;
  self._reject = reject;
  _requestCode = REQUEST_CONTACT;
  [self launchContacts];
}

/* Get ontact email as string */
RCT_EXPORT_METHOD(getEmail:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  self._resolve = resolve;
  self._reject = reject;
  _requestCode = REQUEST_EMAIL;
  [self launchContacts];
}

RCT_EXPORT_METHOD(editContact: (NSString *)contactID resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  self._resolve = resolve;
  self._reject = reject;
  _requestCode = REQUEST_EDIT_CONTACT;
  
  [self launchEditContact:contactID];
}

- (void)contactViewController:(CNContactViewController *)viewController didCompleteWithContact:(nullable CNContact *)contact{
  //You will get the callback here
  if(contact){
    NSMutableDictionary *contactData = [self emptyContactDict];
    
    NSString *fullName = [self getFullNameForFirst:contact.givenName middle:contact.middleName last:contact.familyName ];
    NSString *contactID = contact.identifier;
    NSArray *phoneNos = contact.phoneNumbers;
    NSArray *emailAddresses = contact.emailAddresses;
    // [self emailPicked:contactID];
    [contactData setValue:contactID forKey:@"identifier"];
    //Return full name
    [contactData setValue:fullName forKey:@"name"];
    
    //Return first phone number
    if([phoneNos count] > 0) {
      CNPhoneNumber *phone = ((CNLabeledValue *)phoneNos[0]).value;
      [contactData setValue:phone.stringValue forKey:@"phone"];
    }
    
    //Return first email address
    if([emailAddresses count] > 0) {
      [contactData setValue:((CNLabeledValue *)emailAddresses[0]).value forKey:@"email"];
    }
    
    [self contactPicked:contactData];
    
  }else{
    [self pickerCancelled];
  }
  
  UIViewController *root = [[[UIApplication sharedApplication] delegate] window].rootViewController;
  BOOL modalPresent = (BOOL) (root.presentedViewController);
  if (modalPresent) {
    UIViewController *parent = root.presentedViewController;
    [parent dismissViewControllerAnimated:NO completion:nil];
  } else {
    [root dismissViewControllerAnimated:NO completion:nil];
  }
}

-(void) launchEditContact: (NSString *)contactID {
  //  RCTLogInfo(@"Pretending to create an event %@ ", contactID);
  //Create repository objects contacts
  CNContactStore *contactStore = [[CNContactStore alloc] init];
  //Select the contact you want to import the key attribute  ( https://developer.apple.com/library/watchos/documentation/Contacts/Reference/CNContact_Class/index.html#//apple_ref/doc/constant_group/Metadata_Keys )
  
  NSArray *keys = [[NSArray alloc]initWithObjects:CNContactIdentifierKey, CNContactEmailAddressesKey, CNContactBirthdayKey, CNContactImageDataKey, CNContactPhoneNumbersKey, CNContactViewController.descriptorForRequiredKeys, nil];
  
  CNContact * contact = [contactStore unifiedContactWithIdentifier:contactID keysToFetch:keys error:nil];
  
  if(contact){
    
    // this will open contact for edit
    //    CNContactViewController *editContactVC = [CNContactViewController viewControllerForNewContact:contact];
    //    RCTLogInfo(@"Not pretending");
    // this will open contact in view mode
    CNContactViewController *editContactVC = [CNContactViewController viewControllerForContact:contact];
    editContactVC.delegate                 = self;
    //    editContactVC.allowsEditing = true;
    UINavigationController *navController = [[UINavigationController alloc] initWithRootViewController:editContactVC];
    UIViewController *root = [[[UIApplication sharedApplication] delegate] window].rootViewController;
    BOOL modalPresent = (BOOL) (root.presentedViewController);
    if (modalPresent) {
      UIViewController *parent = root.presentedViewController;
      [parent presentViewController:navController animated:NO completion:nil];
    } else {
      //      RCTLogInfo(@"adding button");
      editContactVC.navigationItem.leftBarButtonItems = @[[[UIBarButtonItem alloc] initWithBarButtonSystemItem: UIBarButtonSystemItemDone target:self action:@selector(pickerCancelled)]];
      [root presentViewController:navController animated:NO completion:nil];
    }
  }else{
    [self pickerError];
  }
}

/**
 Launch the contacts UI
 */
-(void) launchContacts {
  
  if(_requestCode == REQUEST_EMAIL){
    
    CNContactViewController *addContactVC = [CNContactViewController viewControllerForNewContact:nil];
    addContactVC.delegate                 = self;
    UINavigationController *navController = [[UINavigationController alloc] initWithRootViewController:addContactVC];
    UIViewController *root = [[[UIApplication sharedApplication] delegate] window].rootViewController;
    BOOL modalPresent = (BOOL) (root.presentedViewController);
    if (modalPresent) {
      UIViewController *parent = root.presentedViewController;
      [parent presentViewController:navController animated:NO completion:nil];
    } else {
      [root presentViewController:navController animated:NO completion:nil];
    }
  }else{
    
    UIViewController *picker;
    
    //iOS 9+
    picker = [[CNContactPickerViewController alloc] init];
    ((CNContactPickerViewController *)picker).delegate = self;
    //Launch Contact Picker or Address Book View Controller
    UIViewController *root = [[[UIApplication sharedApplication] delegate] window].rootViewController;
    BOOL modalPresent = (BOOL) (root.presentedViewController);
    if (modalPresent) {
      UIViewController *parent = root.presentedViewController;
      [parent presentViewController:picker animated:YES completion:nil];
    } else {
      [root presentViewController:picker animated:YES completion:nil];
    }
  }
  
}


#pragma mark - RN Promise Events

- (void)pickerCancelled {
  if(_requestCode == REQUEST_EDIT_CONTACT){
    
    UIViewController *root = [[[UIApplication sharedApplication] delegate] window].rootViewController;
    BOOL modalPresent = (BOOL) (root.presentedViewController);
    if (modalPresent) {
      UIViewController *parent = root.presentedViewController;
      [parent dismissViewControllerAnimated: YES completion:nil];
    } else {
      //        RCTLogInfo(@"dismissing view screen");
      [root dismissViewControllerAnimated:YES completion:nil];
    }
  }
  self._reject(@"E_CONTACT_CANCELLED", @"Cancelled", nil);
}


- (void)pickerError {
  self._reject(@"E_CONTACT_EXCEPTION", @"Unknown Error", nil);
}

- (void)pickerNoEmail {
  self._reject(@"E_CONTACT_NO_EMAIL", @"No email found for contact", nil);
}

-(void)emailPicked:(NSString *)email {
  self._resolve(email);
}


-(void)contactPicked:(NSDictionary *)contactData {
  self._resolve(contactData);
}


#pragma mark - Shared functions


- (NSMutableDictionary *) emptyContactDict {
  return [[NSMutableDictionary alloc] initWithObjects:@[@"", @"", @""] forKeys:@[@"name", @"phone", @"email"]];
}

/**
 Return full name as single string from first last and middle name strings, which may be empty
 */
-(NSString *) getFullNameForFirst:(NSString *)fName middle:(NSString *)mName last:(NSString *)lName {
  //Check whether to include middle name or not
  NSArray *names = (mName.length > 0) ? [NSArray arrayWithObjects:fName, mName, lName, nil] : [NSArray arrayWithObjects:fName, lName, nil];
  return [names componentsJoinedByString:@" "];
}



#pragma mark - Event handlers - iOS 9+
- (void)contactPicker:(CNContactPickerViewController *)picker didSelectContact:(CNContact *)contact {
  switch(_requestCode){
    case REQUEST_CONTACT:
    {
      /* Return NSDictionary ans JS Object to RN, containing basic contact data
       This is a starting point, in future more fields should be added, as required.
       This could also be extended to return arrays of phone numbers, email addresses etc. instead of jsut first found
       */
      NSMutableDictionary *contactData = [self emptyContactDict];
      
      NSString *fullName = [self getFullNameForFirst:contact.givenName middle:contact.middleName last:contact.familyName ];
      NSArray *phoneNos = contact.phoneNumbers;
      NSArray *emailAddresses = contact.emailAddresses;
      
      //Return full name
      [contactData setValue:fullName forKey:@"name"];
      
      //Return first phone number
      if([phoneNos count] > 0) {
        CNPhoneNumber *phone = ((CNLabeledValue *)phoneNos[0]).value;
        [contactData setValue:phone.stringValue forKey:@"phone"];
      }
      
      //Return first email address
      if([emailAddresses count] > 0) {
        [contactData setValue:((CNLabeledValue *)emailAddresses[0]).value forKey:@"email"];
      }
      
      [self contactPicked:contactData];
    }
      break;
    case REQUEST_EMAIL :
    {
      /* Return Only email address as string */
      if([contact.emailAddresses count] < 1) {
        [self pickerNoEmail];
        return;
      }
      
      CNLabeledValue *email = contact.emailAddresses[0].value;
      [self emailPicked:email];
    }
      break;
    default:
      //Should never happen, but just in case, reject promise
      [self pickerError];
      break;
  }
  
  
}


- (void)contactPickerDidCancel:(CNContactPickerViewController *)picker {
  [self pickerCancelled];
}

@end

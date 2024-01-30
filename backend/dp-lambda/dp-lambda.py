import json
import logging
import time
import boto3
from botocore.exceptions import ClientError


logger = logging.getLogger(__name__)


class SnsWrapper:
    def __init__(self, sns_resource):
        self.sns_resource = sns_resource

    def publish_text_message(self, phone_number, message):
        try:
            response = self.sns_resource.meta.client.publish(
                PhoneNumber=phone_number, Message=message
            )
            message_id = response["MessageId"]
            logger.info("Published message to %s.", phone_number)
        except ClientError:
            logger.exception("Couldn't publish message to %s.", phone_number)
        else:
            return message_id


def usage_demo():
    print('-' * 88)
    print("Welcome to the Amazon Simple Notification Service (Amazon SNS) demo!")
    print("-" * 88)

    logging.basicConfig(level=logging.INFO,
                        format="%(levelname)s: %(message)s")

    sns_wrapper = SnsWrapper(boto3.resource('sns'))
    phone_number = input(
        "Enter a phone number (in E.164 format) that can receive SMS messages: "
    )
    if phone_number != "":
        print(f"Sending an SMS message directly from SNS to {phone_number}.")
        sns_wrapper.publish_text_message(
            phone_number, "Hello from the SNS demo!")


if __name__ == "__main__":
    usage_demo()

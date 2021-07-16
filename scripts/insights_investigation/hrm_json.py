#!/usr/bin/python
import pandas as pd
import sys
import subprocess
'''
This script takes in two dataframes: one from the HRM and one from Insights and strips them
down to basic info: date, queue, channel, taskID. The script returns a dataframe with records that 
don't match between the two dataframes, organized by TaskID.
'''

'''
Generates the Insights report for comparison
'''
def main():
    username = sys.argv[1]
    password = sys.argv[2]
    workspaceId = sys.argv[3]

    subprocess.call("./insights.sh %s %s % s < reportIds.txt" % (username, password, workspaceId), shell=True)
    f = open('reportIds.txt', 'r')
    report = f.readline()
    hrm_file="test_dataframes/_Contacts__202107121258.csv"
    insights_file = f'{report.strip()}_report.csv'
    comparison(hrm_file, insights_file)

'''
Reads in hrm and prints differences between HRM and Insights (based on date, queue, and taskId)
'''
def comparison(hrm_file, insights_file):
    #reads in hrm and insights dataframe, 
    df_hrm = pd.read_csv(hrm_file)
    df_insights = pd.read_csv(insights_file)
    basic_hrm, basic_insights = basic_format(df_hrm, df_insights)
    diff_records = unaligned_records(basic_insights, basic_hrm)
    miss_records = missing_records(basic_insights, basic_hrm)

    #outputs difference between HRM and Insights in CSV
    pd.set_option('display.width', 150)
    pd.set_option("display.max_rows", None, "display.max_columns", None)
    diff_records.to_csv('diff_records.csv')
    miss_records.to_csv("missing_records.csv")

'''
This function takes in the HRM dataframe, the Insights dataframe, and returns a stripped version of both.
The stripped dataframes retain date, queue, channel, and taskId information.
'''
def basic_format(df_hrm, df_insights):
    basic_hrm = df_hrm.copy()
    basic_hrm['timeOfContact'] = pd.to_datetime(basic_hrm['timeOfContact'])
    basic_hrm['date'] = basic_hrm['timeOfContact'].dt.date
    basic_hrm['date']= pd.to_datetime(basic_hrm['date'])
    basic_hrm = basic_hrm[['date','queueName', 'channel', 'taskId']]
    basic_hrm = basic_hrm.rename(columns = {'date':'Date', 'queueName':'Queue', 'channel': 'Communication Channel', 'taskId': 'Segment'})

    channel_type = {
        'Call':'voice',
        'Twitter': 'twitter',
        'SMS': 'sms',
        'Facebook': 'facebook',
        'Chat': 'Webchat',
        'Web': 'web',
        'WhatsApp':'whatsapp'
    }

    basic_insights = df_insights.copy()
    basic_insights = basic_insights.drop(['Time'], axis=1)
    basic_insights['Communication Channel'].replace(channel_type, inplace=True)
    basic_insights['Date'] = pd.to_datetime(basic_insights['Date'])
    return basic_hrm, basic_insights

'''
This function takes in the stripped insights and hrm dataframes. It returns a dataframe with tasks that differ
between the dataframes, organized by taskId. The dataframe also contains the original values of the HRM and Inights dataframes.
'''
def unaligned_records(basic_insights, basic_hrm):
    basic_insights = basic_insights.set_index('Segment')
    basic_hrm= basic_hrm.set_index('Segment')
    diff_df = pd.merge(basic_hrm, basic_insights, left_index=True, right_index=True)
    diff_df = diff_df.loc[(diff_df['Date_x'] != diff_df['Date_y']) | (diff_df['Communication Channel_x'] != diff_df['Communication Channel_y']) | (diff_df['Queue_x'] != diff_df['Queue_y'])]
    return diff_df

def missing_records(basic_insights, basic_hrm):
    basic_insights['origin'] = 'Insights'
    basic_hrm['origin'] = 'hrm'
    diff_df = pd.concat([basic_insights, basic_hrm], axis=0)
    diff_df=diff_df.drop_duplicates(['Segment'], keep='first')
    diff_df.set_index('Segment')

    return diff_df

main()
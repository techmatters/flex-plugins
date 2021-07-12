import pandas as pd

'''
This script takes in two dataframes: one from the HRM and one from Insights and strips them
down to basic info: date, queue, channel, taskID. The script returns a dataframe with records that 
don't match between the two dataframes, organized by TaskID.
'''
"""
Reads in hrm and prints differences between HRM and Insights (based on date, queue, and taskId)
"""
def main():
    #reads in hrm and insights dataframe, 
    df_hrm = pd.read_csv("test_dataframes/_Contacts__202107121258.csv")
    df_insights = pd.read_csv("test_dataframes/Basic Audit_small.csv")
    basic_hrm, basic_insights = basic_format(df_hrm, df_insights)
    diff_records = missing_records(basic_insights, basic_hrm)

    #outputs difference between HRM and Insights in CSV
    pd.set_option('display.width', 150)
    pd.set_option("display.max_rows", None, "display.max_columns", None)
    diff_records.to_csv('diff_records.csv')


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
def missing_records(basic_insights, basic_hrm):
    basic_insights = basic_insights.set_index('Segment')
    basic_hrm= basic_hrm.set_index('Segment')
    diff_df = pd.merge(basic_hrm, basic_insights, left_index=True, right_index=True)
    diff_df = diff_df.loc[(diff_df['Date_x'] != diff_df['Date_y']) | (diff_df['Communication Channel_x'] != diff_df['Communication Channel_y']) | (diff_df['Queue_x'] != diff_df['Queue_y'])]
    return diff_df
    

main()
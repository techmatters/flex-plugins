import json
import pprint

'''
These set of functions are used to separate the info in the rawJson column in the HRM databse.
Each function returns information about the contact in the form of python dictionaries.
'''
def caseInfo(df_hrm):
    test_record = df_hrm.iloc[58]
    test_record_dictionary = test_record.to_dict()
    test_record_dictionary.pop('rawJson', None)

    test_dict = json.loads(test_record['rawJson'])
    print(test_record['queueName'])
    pprint.pprint(test_record_dictionary)

    childInfo_df, callerInfo_df, contactlessInfo_df = getChildInfo(test_dict)
    caseInfo, contactResolution = getCaseInfo(test_dict)
    return childInfo_df, callerInfo_df, contactlessInfo_df, caseInfo, contactResolution

def getChildInfo(test_dict):
    #get child information, returns dictionary with child info formatted
    childInfo_df = test_dict['childInformation']
    childInfo_df['name'] = f"{childInfo_df['name']['firstName']} {childInfo_df['name']['lastName']}"

    #gets caller info, returns dictionary with caller info formatted
    callerInfo_df = test_dict['callerInformation']
    callerInfo_df['name'] = f"{callerInfo_df['name']['firstName']} {callerInfo_df['name']['lastName']}"

    #gets contactless info
    contactlessInfo_df = test_dict['contactlessTask']

    return childInfo_df, callerInfo_df, contactlessInfo_df

def getCaseInfo(test_dict):
    #gets case information and splits into individual dictionaries
    accessibility_df = test_dict['caseInformation']['categories']['Accessibility']
    disc_df = test_dict['caseInformation']['categories']['Discrimination and Exclusion']
    edu_df = test_dict['caseInformation']['categories']['Education and Occupation']
    family_df = test_dict['caseInformation']['categories']['Family Relationships']
    mentalHealth_df = test_dict['caseInformation']['categories']['Mental Health']
    nonCounseling_df = test_dict['caseInformation']['categories']['Non-Counselling contacts']
    peers_df = test_dict['caseInformation']['categories']['Peer Relationships']
    physical_df = test_dict['caseInformation']['categories']['Physical Health']
    sexuality_df = test_dict['caseInformation']['categories']['Sexuality']
    violence_df = test_dict['caseInformation']['categories']['Violence']
    caseInfo = [accessibility_df, disc_df, edu_df, family_df, mentalHealth_df, nonCounseling_df, peers_df, physical_df, sexuality_df, violence_df]

    #gets just call resolution info (i.e call summary, info about convo with counselor)
    contactResolution = test_dict['caseInformation'].copy()
    contactResolution.pop('categories', None)

    return  caseInfo, contactResolution
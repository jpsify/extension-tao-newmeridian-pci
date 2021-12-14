<responseCondition>
    <responseIf>
        <match>
            <variable identifier="{{correctId}}" />
            <baseValue baseType="integer">{{matches}}</baseValue>
        </match>
        <setOutcomeValue identifier="SCORE">
            <sum>
                <variable identifier="SCORE" />
                <baseValue baseType="float">{{score}}</baseValue>
            </sum>
        </setOutcomeValue>
    </responseIf>
</responseCondition>
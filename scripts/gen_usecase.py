c = []

def vtx(i, v, s, x, y, w, h):
    c.append('<mxCell id="%s" value="%s" style="%s" vertex="1" parent="1"><mxGeometry x="%d" y="%d" width="%d" height="%d" as="geometry"/></mxCell>' % (i, v, s, x, y, w, h))

e_cnt = [0]
def edge(source_id, target_id, is_left_actor=True):
    e_cnt[0] += 1
    # For stick figure actors:
    # Left actor (Admin) connects from right hand (exitX=1, exitY=0.33) -> use case left edge (entryX=0, entryY=0.5)
    # Right actors (Customer, Rider) connect from left hand (exitX=0, exitY=0.33) -> use case right edge (entryX=1, entryY=0.5)
    if is_left_actor:
        s = 'endArrow=none;html=1;rounded=0;strokeColor=#3f536e;strokeWidth=1.5;exitX=1;exitY=0.33;exitDx=0;exitDy=0;exitPerimeter=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;entryPerimeter=0;'
    else:
        s = 'endArrow=none;html=1;rounded=0;strokeColor=#3f536e;strokeWidth=1.5;exitX=0;exitY=0.33;exitDx=0;exitDy=0;exitPerimeter=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;entryPerimeter=0;'
    c.append('<mxCell id="ue%d" style="%s" edge="1" parent="1" source="%s" target="%s"><mxGeometry relative="1" as="geometry"/></mxCell>' % (e_cnt[0], s, source_id, target_id))

# 1. Title & Figure caption
vtx('title', '&lt;b&gt;USE CASE DIAGRAM OF THE PROPOSED SYSTEM&lt;/b&gt;', 'text;html=1;align=left;verticalAlign=middle;fontSize=18;fontStyle=1;', 40, 30, 600, 30)
vtx('caption', '&lt;b&gt;Figure: Use Case Diagram&lt;/b&gt;', 'text;html=1;align=center;verticalAlign=middle;fontSize=16;fontStyle=1;', 400, 1020, 400, 30)

# 2. System Boundary Box
SYS_BOX = 'rounded=1;arcSize=4;fillColor=#f8fafd;strokeColor=#8ea0b5;strokeWidth=2.5;verticalAlign=top;fontStyle=1;fontSize=13;fontColor=#2d3748;spacingTop=12;'
vtx('sys_boundary', 'Online Pizza Ordering &amp; Delivery System', SYS_BOX, 370, 80, 460, 910)

# 3. Actors (Admin on Left, Customer and Rider on Right)
ACTOR_STYLE = 'shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=none;strokeColor=#2f4052;strokeWidth=2;fontSize=13;fontStyle=1;'

# Administrator (Left)
vtx('actor_admin', 'Administrator', ACTOR_STYLE, 130, 460, 70, 140)

# Customer (Right, upper)
vtx('actor_cust', 'Customer', ACTOR_STYLE, 1000, 310, 70, 140)

# Rider (Right, lower)
vtx('actor_rider', 'Rider', ACTOR_STYLE, 1000, 650, 70, 140)

# 4. Use Cases
use_cases = [
    ('uc1', 'Register / Login (Authentication)', ['actor_admin', 'actor_cust', 'actor_rider']),
    ('uc2', 'Manage Profile &amp; Delivery Address', ['actor_cust']),
    ('uc3', 'Browse Pizza Menu &amp; Categories', ['actor_cust']),
    ('uc4', 'Manage Cart &amp; Place Pizza Order', ['actor_cust']),
    ('uc5', 'Process Payment &amp; View Receipt', ['actor_admin', 'actor_cust']),
    ('uc6', 'Track Order &amp; Live Delivery Status', ['actor_cust', 'actor_rider']),
    ('uc7', 'Manage Assigned Deliveries', ['actor_admin', 'actor_rider']),
    ('uc8', 'Update Delivery Status &amp; Location', ['actor_rider']),
    ('uc9', 'Manage Pizza Menu &amp; Pricing', ['actor_admin']),
    ('uc10', 'Manage Orders &amp; Rider Assignments', ['actor_admin']),
    ('uc11', 'View Sales Analytics &amp; Reports Dashboard', ['actor_admin']),
    ('uc12', 'Manage Users &amp; Rider Accounts', ['actor_admin']),
]

UC_STYLE = 'ellipse;whiteSpace=wrap;html=1;fillColor=#eef8f8;strokeColor=#1e6b7b;strokeWidth=2;fontSize=11.5;fontStyle=1;fontColor=#1b3a4b;'

start_y = 125
spacing = 70
for i, (uid, label, actors) in enumerate(use_cases):
    cy = start_y + (i * spacing)
    vtx(uid, label, UC_STYLE, 410, cy, 380, 50)
    for act in actors:
        is_left = (act == 'actor_admin')
        edge(act, uid, is_left_actor=is_left)

xml = ('<mxfile host="app.diagrams.net"><diagram name="Use Case Diagram">'
       '<mxGraphModel dx="1400" dy="1100" grid="1" gridSize="10" pageWidth="1200" pageHeight="1100">'
       '<root><mxCell id="0"/><mxCell id="1" parent="0"/>' + ''.join(c) + '</root>'
       '</mxGraphModel></diagram></mxfile>')

open('pizza-use-case.drawio', 'w', encoding='utf8').write(xml)

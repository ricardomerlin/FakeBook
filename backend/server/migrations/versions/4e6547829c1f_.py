"""empty message

Revision ID: 4e6547829c1f
Revises: 
Create Date: 2024-03-12 20:27:11.457388

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4e6547829c1f'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('profile_table',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('email', sa.String(length=120), nullable=False),
    sa.Column('username', sa.String(length=50), nullable=False),
    sa.Column('password', sa.String(length=100), nullable=False),
    sa.Column('birthday', sa.Date(), nullable=True),
    sa.Column('profile_picture', sa.String(length=500), nullable=True),
    sa.Column('description', sa.String(length=400), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('username')
    )
    op.create_table('post_table',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('content', sa.String(length=500), nullable=False),
    sa.Column('sticker', sa.String(length=200), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('profile_picture', sa.String(length=500), nullable=True),
    sa.Column('profile_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['profile_id'], ['profile_table.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('comment_table',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('content', sa.String(length=300), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('profile_picture', sa.String(length=500), nullable=True),
    sa.Column('profile_id', sa.Integer(), nullable=True),
    sa.Column('post_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['post_id'], ['post_table.id'], ),
    sa.ForeignKeyConstraint(['profile_id'], ['profile_table.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('like_table',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('profile_id', sa.Integer(), nullable=True),
    sa.Column('post_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['post_id'], ['post_table.id'], ),
    sa.ForeignKeyConstraint(['profile_id'], ['profile_table.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('like_table')
    op.drop_table('comment_table')
    op.drop_table('post_table')
    op.drop_table('profile_table')
    # ### end Alembic commands ###